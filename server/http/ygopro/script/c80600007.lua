--ＢＫ ラビット・パンチャー
function c80600007.initial_effect(c)
	--destroy
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600007,0))
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_BATTLE_START)
	e1:SetTarget(c80600007.destg)
	e1:SetOperation(c80600007.desop)
	c:RegisterEffect(e1)
end
function c80600007.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local d=Duel.GetAttackTarget()
	if chk ==0 then	return Duel.GetAttacker()==e:GetHandler()
		and d~=nil and d:IsDefencePos() and d:IsDestructable() end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,d,1,0,0)
end
function c80600007.desop(e,tp,eg,ep,ev,re,r,rp)
	local d=Duel.GetAttackTarget()
	if d~=nil and d:IsRelateToBattle() and d:IsDefencePos() then
		Duel.Destroy(d,REASON_EFFECT)
	end
end
