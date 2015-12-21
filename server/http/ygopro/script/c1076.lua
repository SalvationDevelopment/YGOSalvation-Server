--ライノタウルス
function c1076.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_EXTRA_ATTACK)
	e1:SetCondition(c1076.macon)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	if not c1076.global_check then
		c1076.global_check=true
		c1076[0]=0
		c1076[1]=0
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_BATTLE_DESTROYING)
		ge1:SetOperation(c1076.checkop)
		Duel.RegisterEffect(ge1,0)
		local ge2=Effect.CreateEffect(c)
		ge2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge2:SetCode(EVENT_PHASE_START+PHASE_DRAW)
		ge2:SetOperation(c1076.clear)
		Duel.RegisterEffect(ge2,0)
	end
end
function c1076.checkop(e,tp,eg,ep,ev,re,r,rp)
	local cp=eg:GetFirst():GetControler()
	c1076[cp]=c1076[cp]+1
end
function c1076.clear(e,tp,eg,ep,ev,re,r,rp)
	c1076[0]=0
	c1076[1]=0
end
function c1076.macon(e)
	return c1076[e:GetHandlerPlayer()]>=2
end
