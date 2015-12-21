--Protector of the Shrine
function c94000190.initial_effect(c)
    --double tribute
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_DOUBLE_TRIBUTE)
	e1:SetValue(c94000190.val)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetRange(LOCATION_GRAVE+LOCATION_HAND)
	e2:SetCountLimit(1,94000190)
	e2:SetCondition(c94000190.con)
	e2:SetTarget(c94000190.tg)
	e2:SetOperation(c94000190.op)
	c:RegisterEffect(e2)
end
function c94000190.val(e,c)
    return c:IsRace(RACE_DRAGON)
end
function c94000190.filter(c)
    return c:IsRace(RACE_DRAGON) and c:IsPreviousPosition(POS_FACEUP) and c:GetPreviousLocation(LOCATION_MZONE) 
	    and (c:IsReason(REASON_EFFECT) or c:IsReason(REASON_BATTLE)) and not c:IsCode(94000190)
end
function c94000190.addfilter(c,tp)
    return c:IsRace(RACE_DRAGON) and c:IsType(TYPE_NORMAL) and c:IsLocation(LOCATION_GRAVE) and c:GetPreviousControler()==tp and c:IsAbleToHand()
end
function c94000190.con(e,tp,eg,ep,ev,re,r,rp)
    return eg:IsExists(c94000190.filter,1,nil)
end
function c94000190.tg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c94000190.op(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end
    local c=e:GetHandler()
	if c:IsRelateToEffect(e) then 
	    Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
		if eg:IsExists(c94000190.addfilter,1,nil,tp) and Duel.SelectYesNo(tp,aux.Stringid(94000190,0)) then 
		    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND) 
			local g=eg:FilterSelect(tp,c94000190.addfilter,1,1,nil,tp)
			if g:GetCount()>0 then 
			    Duel.SendtoHand(g,nil,REASON_EFFECT)
				Duel.ConfirmCards(1-tp,g)
			end
		end
	end
end