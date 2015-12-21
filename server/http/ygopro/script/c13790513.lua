--Protector of the Shrine
function c13790513.initial_effect(c)
	--double tribute
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_DOUBLE_TRIBUTE)
	e1:SetValue(c13790513.dccon)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13790513,0))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e2:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCountLimit(1,13790513)
	e2:SetCondition(c13790513.spscon)
	e2:SetTarget(c13790513.spstg)
	e2:SetOperation(c13790513.spsop)
	c:RegisterEffect(e2)
end
function c13790513.dccon(e,c)
	return c:IsRace(RACE_DRAGON)
end
function c13790513.filter(c)
	return c:IsRace(RACE_DRAGON) and c:IsPreviousLocation(LOCATION_ONFIELD) and c:IsReason(REASON_BATTLE+REASON_EFFECT) and c:GetCode()~=13790513
end
function c13790513.spscon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c13790513.filter,1,nil)
end
function c13790513.spstg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,true,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c13790513.rfilter(c)
	return c:IsRace(RACE_DRAGON) and c:IsReason(REASON_BATTLE+REASON_EFFECT) and c:IsType(TYPE_NORMAL)
end
function c13790513.thfilter(c)
	return c:IsRace(RACE_DRAGON) and c:IsType(TYPE_NORMAL) and c:IsAbleToHand()
end
function c13790513.spsop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
		if g:IsExists(Card.IsType,1,nil,TYPE_NORMAL) and Duel.SelectYesNo(tp,aux.Stringid(85489096,0)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
			local g=Duel.SelectMatchingCard(tp,c13790513.thfilter,tp,LOCATION_GRAVE,0,1,1,nil)
			if g:GetCount()>0 then
				Duel.SendtoHand(g,nil,REASON_EFFECT)
				Duel.ConfirmCards(1-tp,g)
			end
		end
	end
end

