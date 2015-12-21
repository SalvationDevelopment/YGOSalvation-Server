--Scripted by Eerie Code
--Speedroid Red-Eyed Dice
function c16725505.initial_effect(c)
	--Change level
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(16725505,0))
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY+EFFECT_FLAG_CARD_TARGET)
	e2:SetTarget(c16725505.thtg)
	e2:SetOperation(c16725505.thop)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e3)
end

function c16725505.thfil(c)
	return c:IsFaceup() and c:GetLevel()>0 and c:IsSetCard(0x2016)
end
function c16725505.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c16725505.thfil(chkc) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c16725505.thfil,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.SelectTarget(tp,c16725505.thfil,tp,LOCATION_MZONE,0,1,1,e:GetHandler())
	local t={}
	local i=1
	local p=1
	for i=1,6 do
		t[p]=i
		p=p+1
	end
	t[p]=nil
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(16725505,1))
	e:SetLabel(Duel.AnnounceNumber(tp,table.unpack(t)))
end
function c16725505.lvfil(c,e)
	return c:IsFaceup() and c:IsRelateToEffect(e)
end
function c16725505.thop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(c16725505.lvfil,nil,e)
	local tc=g:GetFirst()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CHANGE_LEVEL)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e1:SetValue(e:GetLabel())
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	tc:RegisterEffect(e1)
end