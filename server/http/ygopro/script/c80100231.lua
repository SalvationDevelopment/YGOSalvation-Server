--人造人間－サイコ・ジャッカー
function c80100231.initial_effect(c)
	--to hand
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100231,0))
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,80100231)
	e1:SetCost(c80100231.cost)
	e1:SetTarget(c80100231.target)
	e1:SetOperation(c80100231.operation)
	c:RegisterEffect(e1)
	--change name
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetCode(EFFECT_CHANGE_CODE)
	e2:SetRange(LOCATION_MZONE+LOCATION_GRAVE)
	e2:SetValue(77585513)
	c:RegisterEffect(e2)
end
function c80100231.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() end
	Duel.Release(e:GetHandler(),REASON_COST)
end
function c80100231.filter(c)
	return c:IsSetCard(0xb9) and c:GetCode()~=80100231 and c:IsAbleToHand()
end
function c80100231.spfilter(c,e,tp)
	return c:IsSetCard(0xb9) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100231.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100231.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80100231.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80100231.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
		local sg=Duel.GetMatchingGroup(Card.IsFacedown,tp,0,LOCATION_SZONE,nil)
		if sg:GetCount()>0 then
			Duel.BreakEffect()
			Duel.ConfirmCards(tp,sg)
			local sc=sg:Filter(Card.IsType,nil,TYPE_TRAP):GetCount()
			local spg=Duel.GetMatchingGroup(c80100231.spfilter,tp,LOCATION_HAND,0,nil,e,tp)
			if sc>0 and spg:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(80100231,1)) then	
				spg=spg:Select(tp,1,sc,nil)
				Duel.SpecialSummon(spg,0,tp,tp,false,false,POS_FACEUP)
			end
		end
	end
end