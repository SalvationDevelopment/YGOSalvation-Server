--ê¬Ç´ä·ÇÃâ≥èó
function c80600101.initial_effect(c)
	--attacked
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_BE_BATTLE_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c80600101.cost)
	e1:SetOperation(c80600101.ngattack)
	c:RegisterEffect(e1)
	--be target
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_CHAINING)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c80600101.spcon)
	e2:SetCost(c80600101.cost)
	e2:SetOperation(c80600101.spop)
	c:RegisterEffect(e2)

end
function c80600101.filter(c,e,tp)
	return c:GetCode()==89631139 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80600101.ngattack(e,tp,eg,ep,ev,re,r,rp)
	if Duel.NegateAttack() then
		local c=e:GetHandler()
		if c:IsFaceup() and c:IsRelateToEffect(e) then
			Duel.ChangePosition(c,POS_FACEUP_DEFENCE,0,POS_FACEUP_ATTACK,0)
			if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
				Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
				local g=Duel.SelectMatchingCard(tp,c80600101.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
				if g:GetCount()>0 then
					Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
			end
		end
	end
end
function c80600101.spcon(e,tp,eg,ep,ev,re,r,rp,chk)
	if not re:IsHasProperty(EFFECT_FLAG_CARD_TARGET) then return end
	local g=Duel.GetChainInfo(ev,CHAININFO_TARGET_CARDS)
	return g and g:IsContains(e:GetHandler())
end
function c80600101.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then
		if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
			local g=Duel.SelectMatchingCard(tp,c80600101.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
			if g:GetCount()>0 then
				Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
			end
		end
end
function c80600101.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600101)==0 end
	Duel.RegisterFlagEffect(tp,80600101,RESET_PHASE+PHASE_END,0,1)
end