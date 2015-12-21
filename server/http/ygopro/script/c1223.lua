--ポセイドン·ウェーブ
function c1223.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c1223.condition)
	e1:SetTarget(c1223.target)
	e1:SetOperation(c1223.activate)
	c:RegisterEffect(e1)
end
function c1223.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp~=Duel.GetTurnPlayer()
end
function c1223.dfilter(c)
	return c:IsFaceup()
end
function c1223.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return tg:IsOnField() and tg:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(tg)
	local dam=Duel.GetMatchingGroupCount(c1223.dfilter,tp,LOCATION_MZONE,0,nil)*800
	if dam>0 then
		Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,dam)
	end
end
function c1223.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsAttackable() and Duel.NegateAttack() then
		local dam=Duel.GetMatchingGroupCount(c1223.dfilter,tp,LOCATION_MZONE,0,nil)*800
		if dam>0 then
			Duel.Damage(1-tp,dam,REASON_EFFECT)
		end
	end
end
