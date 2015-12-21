-- Ashoka Pillar
function c11111104.initial_effect(c)
	--damage
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_DESTROYED)
	e1:SetCondition(c11111104.dmcon)
	e1:SetTarget(c11111104.dmtg)
	e1:SetOperation(c11111104.dmop)
	c:RegisterEffect(e1)
end
function c11111104.dmcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:IsReason(REASON_DESTROY)
		and (not c:IsReason(REASON_BATTLE) or bit.band()~=0)
end
function c11111104.dmtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	Duel.SetTargetPlayer(c:GetPreviousControler())
	Duel.SetTargetParam(2000)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,c:GetPreviousControler(),2000)
end
function c11111104.dmop(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Damage(p,d,REASON_EFFECT)
end
