--ハイパーハンマーヘッド
function c1012.initial_effect(c)
	--return hand
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(1012,0))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_DAMAGE_STEP_END)
	e1:SetCondition(c1012.retcon)
	e1:SetTarget(c1012.rettg)
	e1:SetOperation(c1012.retop)
	c:RegisterEffect(e1)
end
function c1012.retcon(e,tp,eg,ep,ev,re,r,rp)
	local t=e:GetHandler():GetBattleTarget()
	e:SetLabelObject(t)
	return t and t:IsRelateToBattle()
end
function c1012.rettg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,e:GetLabelObject(),1,0,0)
end
function c1012.retop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetLabelObject():IsRelateToBattle() then
		Duel.SendtoHand(e:GetLabelObject(),nil,REASON_EFFECT)
	end
end
