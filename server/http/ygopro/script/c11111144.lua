--Crime and Punishment
function c11111144.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_CONTROL)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_BATTLE_DAMAGE)
	e1:SetCondition(c11111144.con)
	e1:SetTarget(c11111144.tg)
	e1:SetOperation(c11111144.act)
	c:RegisterEffect(e1)
end
function c11111144.con(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp and Duel.GetAttackTarget()==nil and Duel.GetAttacker():IsControler(1-tp)
end
function c11111144.filter(c)
	return c:IsDestructable()
end
function c11111144.filter2(c,e,tp)
	return c:IsLevelBelow(4) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c11111144.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c11111144.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c11111144.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c11111144.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c11111144.act(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
	if Duel.IsExistingMatchingCard(c11111144.filter2,tp,LOCATION_HAND,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local sg=Duel.GetMatchingGroup(c11111144.filter2,tp,LOCATION_HAND,0,nil,e,tp)
		if sg:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(11111144,0)) then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	Duel.SpecialSummon(sg:Select(tp,1,1,nil),0,tp,tp,false,false,POS_FACEUP)
	end
end
